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
    domain_experience: bool = False
    technical_skills: bool = False
    relevant_network: bool = False


# ── Helpers ───────────────────────────────────────────────────────────────────

async def llm(system: str, user: str, json_mode: bool = False, temperature: float = 0.0) -> str:
    kwargs = {"response_format": {"type": "json_object"}} if json_mode else {}
    resp = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        max_tokens=512,
        temperature=temperature,
        **kwargs,
    )
    return resp.choices[0].message.content.strip()


# ── Pipeline ──────────────────────────────────────────────────────────────────

async def validate_idea(idea: str) -> bool:
    raw = await llm(
        "You are an idea validator. Determine if the user's input is a coherent startup idea or just gibberish/random words. "
        "Return ONLY valid JSON: {\"is_valid\": true/false}",
        idea,
        json_mode=True,
    )
    return json.loads(raw).get("is_valid", True)

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
                return 5.5
            total_score = sum(p["data"]["score"] for p in posts)
            num_comments = sum(p["data"]["num_comments"] for p in posts)
            raw = min((total_score / 20000) + (num_comments / 2000), 10)
            remapped = 5.0 + (max(raw, 0) / 2.0)
            return round(min(remapped, 10.0), 2)
        except Exception:
            return 6.0


def get_trend_score(keywords: list[str]) -> float:
    try:
        pytrends = TrendReq(hl="en-US", tz=360)
        kw = keywords[:1]
        pytrends.build_payload(kw, timeframe="today 12-m")
        df = pytrends.interest_over_time()
        if df.empty:
            return 5.5
        avg = df[kw[0]].mean()
        recent = df[kw[0]].iloc[-4:].mean()
        momentum = (recent - avg) / max(avg, 1)
        raw = (avg / 10) + (momentum * 2)
        remapped = 5.0 + (min(max(raw, 0), 10) / 2.0)
        return round(min(remapped, 10.0), 2)
    except Exception:
        return 6.0


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


async def get_business_profile(idea: str) -> dict:
    raw = await llm(
        "You are a master product strategist. Analyze this startup idea and provide the following in JSON format: "
        "1. elevator_pitch (string, max 150 chars, catchy) "
        "2. target_audience (string, specifically who it's for, max 100 chars) "
        "3. monetization (string, e.g. 'B2B SaaS ($29/mo) + Usage Fees', max 100 chars) "
        "4. competitors (list of strings, 1-3 direct or indirect competitors/alternatives) ",
        f"Idea: {idea}",
        json_mode=True
    )
    try:
        return json.loads(raw)
    except Exception:
        return {"elevator_pitch": "Idea is too ambiguous.", "target_audience": "Unknown", "monetization": "Unknown", "competitors": []}


async def get_extended_scores(idea: str, keywords: list[str]) -> dict:
    """Single LLM call for all 5 new scores to minimize latency."""
    raw = await llm(
        "You are a startup analyst. Score this idea on these 5 dimensions, each 0.0-10.0 (floats). "
        "Return ONLY valid JSON with these exact keys: "
        "market_size_score (0=niche <$1M TAM, 10=massive >$10B TAM), "
        "willingness_to_pay (0=nobody pays, 10=strong purchase intent), "
        "monetization_clarity (0=no clear model, 10=clear proven model), "
        "defensibility (0=easily copied, 10=strong moat), "
        "regulatory_risk (0=no barriers, 10=heavily regulated industry), "
        "time_to_revenue (0=years away, 10=can charge day 1)",
        f"Idea: {idea}\nKeywords: {', '.join(keywords)}",
        json_mode=True,
        temperature=0.2,
    )
    try:
        d = json.loads(raw)
        defaults = {"market_size_score": 5.0, "willingness_to_pay": 5.0, "monetization_clarity": 5.0, "defensibility": 5.0, "regulatory_risk": 3.0, "time_to_revenue": 5.0}
        return {k: float(d.get(k, defaults[k])) for k in defaults}
    except Exception:
        return {"market_size_score": 5.0, "willingness_to_pay": 5.0, "monetization_clarity": 5.0, "defensibility": 5.0, "regulatory_risk": 3.0, "time_to_revenue": 5.0}


def compute_founder_fit(domain: bool, technical: bool, network: bool) -> float:
    """0-10 founder fit score from 3 yes/no questions."""
    score = (domain * 4.0) + (technical * 3.5) + (network * 2.5)
    return round(score, 1)


# ── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze(req: IdeaRequest, db: AsyncSession = Depends(get_db)):
    idea_text = req.idea.strip()
    if not idea_text:
        raise HTTPException(400, "Idea cannot be empty")

    # Validate gibberish
    is_valid = await validate_idea(idea_text)
    if not is_valid:
        raise HTTPException(400, "This doesn't look like a coherent startup idea. Please provide a clear concept instead of gibberish.")

    keywords = await extract_keywords(idea_text)
    demand_score = await get_demand_score(keywords)
    trend_score = get_trend_score(keywords)
    competition_score = await get_competition_score(keywords, req.idea)
    extended = await get_extended_scores(idea_text, keywords)
    founder_fit = compute_founder_fit(req.domain_experience, req.technical_skills, req.relevant_network)

    market_size_score = extended["market_size_score"]
    willingness_to_pay = extended["willingness_to_pay"]
    monetization_clarity = extended["monetization_clarity"]
    defensibility = extended["defensibility"]
    regulatory_risk = extended["regulatory_risk"]
    time_to_revenue = extended["time_to_revenue"]

    # 9-factor weighted viability formula (CB Insights model)
    raw_v = (
        0.20 * demand_score +
        0.15 * trend_score +
        0.15 * market_size_score +
        0.10 * willingness_to_pay +
        0.10 * founder_fit +
        0.10 * monetization_clarity +
        0.10 * defensibility +
        0.05 * (10 - regulatory_risk) +   # inverted
        0.05 * (10 - competition_score)    # inverted
    )
    viability_score = round(min(max(4.0 + (raw_v * 0.6), 4.0), 10.0), 2)

    ai_feedback = await get_ai_feedback(
        req.idea, demand_score, trend_score, competition_score, viability_score
    )
    roast = await get_roast(req.idea, viability_score) if req.roast_mode else None
    business_profile = await get_business_profile(req.idea)

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
        roast=roast,
        elevator_pitch=business_profile.get("elevator_pitch", ""),
        target_audience=business_profile.get("target_audience", ""),
        monetization=business_profile.get("monetization", ""),
        competitors=json.dumps(business_profile.get("competitors", [])),
        market_size_score=market_size_score,
        willingness_to_pay=willingness_to_pay,
        monetization_clarity=monetization_clarity,
        defensibility=defensibility,
        regulatory_risk=regulatory_risk,
        time_to_revenue=time_to_revenue,
        founder_fit=founder_fit,
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
        "elevator_pitch": new_analysis.elevator_pitch,
        "target_audience": new_analysis.target_audience,
        "monetization": new_analysis.monetization,
        "competitors": json.loads(new_analysis.competitors) if new_analysis.competitors else [],
        "market_size_score": market_size_score,
        "willingness_to_pay": willingness_to_pay,
        "monetization_clarity": monetization_clarity,
        "defensibility": defensibility,
        "regulatory_risk": regulatory_risk,
        "time_to_revenue": time_to_revenue,
        "founder_fit": founder_fit,
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
            "elevator_pitch": a.elevator_pitch,
            "target_audience": a.target_audience,
            "monetization": a.monetization,
            "competitors": json.loads(a.competitors) if a.competitors else [],
            "market_size_score": a.market_size_score,
            "willingness_to_pay": a.willingness_to_pay,
            "monetization_clarity": a.monetization_clarity,
            "defensibility": a.defensibility,
            "regulatory_risk": a.regulatory_risk,
            "time_to_revenue": a.time_to_revenue,
            "founder_fit": a.founder_fit,
            "analyzed_at": a.analyzed_at.isoformat()
        })
    return {"history": out}


@app.delete("/history/{analysis_id}")
async def delete_history(analysis_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    await db.delete(analysis)
    await db.commit()
    return {"status": "deleted"}


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}