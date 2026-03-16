from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from groq import AsyncGroq
import httpx, json, os
from pytrends.request import TrendReq
from datetime import datetime
from models import init_db, SessionLocal, Idea, Analysis
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RealityCheck AI")

# dependency
async def get_db():
    async with SessionLocal() as session:
        yield session

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


@app.on_event("startup")
async def startup():
    await init_db()


class IdeaRequest(BaseModel):
    idea: str
    roast_mode: bool = False


# ── Helpers ───────────────────────────────────────────────────────────────────

async def llm(system: str, user: str, json_mode: bool = False) -> str:
    kwargs = {"response_format": {"type": "json_object"}} if json_mode else {}
    resp = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        max_tokens=512,
        **kwargs,
    )
    return resp.choices[0].message.content.strip()


# ── Pipeline ──────────────────────────────────────────────────────────────────

async def extract_keywords(idea: str) -> list[str]:
    raw = await llm(
        "Extract 3-5 short search keywords from a startup idea. "
        "Return ONLY valid JSON: {\"keywords\": [\"...\", \"...\"]}",
        idea,
        json_mode=True,
    )
    return json.loads(raw).get("keywords", [idea])


async def get_demand_score(keywords: list[str]) -> float:
    query = " ".join(keywords[:2])
    url = f"https://www.reddit.com/search.json?q={query}&limit=25&sort=relevance"
    async with httpx.AsyncClient(headers={"User-Agent": "RealityCheckAI/1.0"}) as http:
        try:
            r = await http.get(url, timeout=10)
            posts = r.json()["data"]["children"]
            if not posts:
                return 3.0
            total_score = sum(p["data"]["score"] for p in posts)
            num_comments = sum(p["data"]["num_comments"] for p in posts)
            raw = min((total_score / 20000) + (num_comments / 2000), 10)
            return round(max(1.0, raw), 2)
        except Exception:
            return 4.0


def get_trend_score(keywords: list[str]) -> float:
    try:
        pytrends = TrendReq(hl="en-US", tz=360)
        kw = keywords[:1]
        pytrends.build_payload(kw, timeframe="today 12-m")
        df = pytrends.interest_over_time()
        if df.empty:
            return 2.0
        avg = df[kw[0]].mean()
        recent = df[kw[0]].iloc[-4:].mean()
        momentum = (recent - avg) / max(avg, 1)
        score = (avg / 10) + (momentum * 2)
        return round(min(max(score, 0), 10), 2)
    except Exception:
        return 3.0


async def get_competition_score(keywords: list[str], idea: str) -> float:
    raw = await llm(
        "You are a startup market analyst. Estimate competition level 0-10 "
        "(0=blue ocean, 10=hyper-saturated). "
        "Return ONLY valid JSON: {\"competition_score\": <float>, \"reasoning\": \"<one sentence>\"}",
        f"Idea: {idea}\nKeywords: {', '.join(keywords)}",
        json_mode=True,
    )
    return round(float(json.loads(raw).get("competition_score", 5.0)), 2)


async def get_ai_feedback(idea: str, d: float, t: float, c: float, v: float) -> str:
    return await llm(
        "You are a sharp startup analyst. Give exactly 3 bullet points: "
        "key strength, biggest risk, one actionable next step. "
        "Be blunt and specific. Max 80 words. Use • as bullet character.",
        f"Idea: {idea}\nDemand: {d}/10 | Trend: {t}/10 | Competition: {c}/10 | Viability: {v}/10",
    )


async def get_roast(idea: str, v: float) -> str:
    return await llm(
        "You are a brutally honest, slightly savage Silicon Valley investor. "
        "Roast this startup idea in 3-4 sentences. Be funny, specific, and ruthless "
        "— but end with ONE genuine insight they can actually use. No sugarcoating.",
        f"Idea: {idea} | Viability score: {v}/10",
    )


# ── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze(req: IdeaRequest, db: AsyncSession = Depends(get_db)):
    if not req.idea.strip():
        raise HTTPException(400, "Idea cannot be empty")

    keywords = await extract_keywords(req.idea)
    demand_score = await get_demand_score(keywords)
    trend_score = get_trend_score(keywords)
    competition_score = await get_competition_score(keywords, req.idea)

    raw_v = (demand_score * 0.4) + (trend_score * 0.4) + ((10 - competition_score) * 0.2)
    viability_score = round(min(max(raw_v, 1.0), 10.0), 2)

    ai_feedback = await get_ai_feedback(
        req.idea, demand_score, trend_score, competition_score, viability_score
    )
    roast = await get_roast(req.idea, viability_score) if req.roast_mode else None

    # Save to DB
    new_idea = Idea(text=req.idea)
    db.add(new_idea)
    await db.commit()
    await db.refresh(new_idea)

    new_analysis = Analysis(
        idea_id=new_idea.id,
        keywords=json.dumps(keywords),
        demand_score=demand_score,
        trend_score=trend_score,
        competition_score=competition_score,
        viability_score=viability_score,
        ai_feedback=ai_feedback,
        roast=roast
    )
    db.add(new_analysis)
    await db.commit()
    await db.refresh(new_analysis)

    return {
        "id": new_analysis.id,
        "idea_id": new_idea.id,
        "idea": req.idea,
        "keywords": keywords,
        "demand_score": demand_score,
        "trend_score": trend_score,
        "competition_score": competition_score,
        "viability_score": viability_score,
        "ai_feedback": ai_feedback,
        "roast": roast,
        "analyzed_at": new_analysis.analyzed_at.isoformat(),
    }


@app.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    stmt = select(Analysis).order_by(Analysis.analyzed_at.desc()).limit(10)
    result = await db.execute(stmt)
    analyses = result.scalars().all()
    
    out = []
    for a in analyses:
        # Fetch the related idea query text
        idea_stmt = select(Idea).where(Idea.id == a.idea_id)
        idea_result = await db.execute(idea_stmt)
        idea_obj = idea_result.scalars().first()
        
        out.append({
            "id": a.id,
            "idea_id": a.idea_id,
            "idea": idea_obj.text if idea_obj else "",
            "keywords": json.loads(a.keywords) if a.keywords else [],
            "demand_score": a.demand_score,
            "trend_score": a.trend_score,
            "competition_score": a.competition_score,
            "viability_score": a.viability_score,
            "ai_feedback": a.ai_feedback,
            "roast": a.roast,
            "analyzed_at": a.analyzed_at.isoformat()
        })
    return {"history": out}


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}