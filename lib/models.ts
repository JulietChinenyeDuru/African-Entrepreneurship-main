// lib/models.ts
// ============================================================
// Smart Claude model routing — uses cheap Haiku for 90% of
// tasks and Sonnet only where quality matters most.
//
// Cost comparison per 1M tokens:
//   Haiku 4.5:   $1.00 input  / $5.00 output  ← USE FOR MOST TASKS
//   Sonnet 4.6:  $3.00 input  / $15.00 output ← USE SPARINGLY
//
// Cost per full agent run:
//   All Sonnet:  ~£0.054 per run
//   Mixed:       ~£0.025 per run  (53% cheaper)
//   All Haiku:   ~£0.018 per run  (67% cheaper)
// ============================================================

export const MODELS = {
  // Use Sonnet for tasks needing deep reasoning
  SONNET: 'claude-sonnet-4-6',

  // Use Haiku for everything else — fast + cheap
  HAIKU: 'claude-haiku-4-5-20251001',
}

// Task → model mapping
// Change HAIKU to SONNET for any task if quality is not good enough
export const TASK_MODELS = {
  profileAnalysis:    MODELS.SONNET,   // needs reasoning — use Sonnet
  jobMatching:        MODELS.HAIKU,    // straightforward — use Haiku
  cvTailoring:        MODELS.HAIKU,    // template work — use Haiku
  coverLetter:        MODELS.HAIKU,    // writing task — use Haiku
  atsKeywords:        MODELS.HAIKU,    // extraction task — use Haiku
  changesSummary:     MODELS.HAIKU,    // simple summary — use Haiku
  recruiterFinder:    MODELS.HAIKU,    // lookup task — use Haiku
  nextSteps:          MODELS.HAIKU,    // simple advice — use Haiku
  interviewPrep:      MODELS.HAIKU,    // template advice — use Haiku
}

// Token limits per task — keep low to control costs
export const MAX_TOKENS = {
  profileAnalysis:    800,
  jobMatching:        1200,
  cvTailoring:        1500,
  coverLetter:        500,
  atsKeywords:        600,
  changesSummary:     200,
  recruiterFinder:    100,
  nextSteps:          200,
  interviewPrep:      600,
}
