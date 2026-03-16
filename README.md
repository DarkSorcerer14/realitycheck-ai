# RealityCheck AI — Startup Idea Stress Tester

> An AI-powered platform that evaluates startup ideas using real-world signals before founders invest time and resources.

---

## How It Works

1. User enters a startup idea
2. AI extracts keywords and identifies the problem domain
3. Platform gathers signals from:
   - Reddit discussions and user complaints
   - Google Trends data
   - Product Hunt and competitor platforms
4. NLP models analyze demand, discussions, and market interest
5. Competitor detection and trend analysis are performed
6. Dashboard displays the Startup Viability Score with actionable insights

---

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React / Next.js |
| Backend | Python FastAPI |
| AI / NLP | OpenAI API or open-source LLM |
| Data Sources | Reddit API, Google Trends API, Product Hunt, web scraping |
| Visualization | Chart.js, interactive dashboards |
| Deployment | Cloud platforms (scalable, modular architecture) |

---

### Architecture

```
         ┌─────────────────────────┐
         │          User           │
         │   Enters startup idea   │
         └────────────┬────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │       NLP Engine        │
         │  Keyword extraction ·   │
         │    problem domain ID    │
         └────────────┬────────────┘
                      │
          ┌───────────┼───────────────┐───────────────┐
          ▼           ▼               ▼               ▼
  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ Reddit API │ │   Google   │ │  Product   │ │    Web     │
  │Discussions │ │   Trends   │ │    Hunt    │ │  Scraping  │
  │& complaints│ │  Signals   │ │Competitors │ │Market data │
  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
        └──────────────┴──────────────┴──────────────┘
                                │
                                ▼
         ┌─────────────────────────────────────┐
         │          AI Analysis Layer          │
         │  Demand · competitor detection ·    │
         │            trend scoring            │
         └────────────────┬────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    Scoring Engine     │
              │  Startup Viability    │
              │        Score          │
              └───────────┬───────────┘
                          │
                          ▼
  ┌──────────────────────────────────────────────────┐
  │          Dashboard  (React / Next.js)            │
  │  ┌────────────┐ ┌────────────┐ ┌─────────────┐   │
  │  │   Demand   │ │ Competitor │ │    Trend    │   │
  │  │   score    │ │    map     │ │   growth    │   │
  │  └────────────┘ └────────────┘ └─────────────┘   │
  │        ┌──────────────────────────┐              │
  │        │      AI suggestions      │              │
  │        └──────────────────────────┘              │
  └──────────────────────────────────────────────────┘

  Backend: FastAPI  ·  AI: OpenAI / open-source LLM
  Deployment: Cloud (scalable, modular)
```

## Key Features

- **Real-time demand analysis** from online discussions and user complaints
- **Competitor detection** and similar product discovery
- **Market trend growth analysis** using search signals
- **Startup Viability Score** based on multiple weighted indicators
- **AI feedback** and improvement suggestions for ideas
- **NLP keyword extraction** to map problem–solution space

## Target Users

**Primary:** Startup Founders, Entrepreneurs, Hackathon Participants, Product Managers

**Secondary:** Investors, Incubators & Accelerators, Innovation Labs

## Future Scope

- Deeper market analysis using startup databases
- Investor recommendation system
- Automatic idea improvement suggestions
- Integration with startup incubators
- Predictive success probability models

**Long-term vision:** Evolve into a global platform for startup validation and opportunity discovery.

---

## Team Members

| Name | Registration No. |
|---|---|
| Ayush Aryan | RA2411003012173 |
| Ritvik Verma | RA2411003012176 |
| Vivek Kumar Prusty | RA2411003012179 |
