"""
SquadCredit — Credit Scoring Pipeline
======================================
This is the production pipeline script.

Your backend imports this file and calls score_and_explain()
on every Squad webhook event. That is the only function you need.

Usage
-----
from pipeline import load_artifacts, score_and_explain

model, explainer = load_artifacts()

result = score_and_explain(
    model         = model,
    explainer     = explainer,
    transactions  = [...],   # raw Squad webhook transactions
    association_verified  = 1,
    prior_repayment_score = 0.88,
    neighbour_attested    = 1,
)

print(result["credit_score"])       # e.g. 740
print(result["tier"])               # e.g. "T3 Established"
print(result["explanation_en"])     # English sentences
print(result["explanation_pid"])    # Pidgin sentences
"""

import pickle
import numpy as np
import pandas as pd

# The exact feature columns the model was trained on — in this order
ALL_FEATURES = [
    # Cash Flow (50%)
    "total_inflow_30d",
    "inflow_regularity",
    "inflow_trend",
    "avg_payment_size",
    # Customer (25%)
    "unique_customers_30d",
    "repeat_customer_ratio",
    "customer_growth_rate",
    # Behaviour (15%)
    "savings_retention_rate",
    "weekday_trading_ratio",
    # Trust (10%)
    "association_verified",
    "prior_repayment_score",
    "neighbour_attested",
]


# ════════════════════════════════════════════════════════════════
# FUNCTION 1 — Load the saved model and explainer from disk
# Call this once at backend startup, then reuse the result.
# ════════════════════════════════════════════════════════════════

def load_artifacts(model_path="saved_model/squadcredit_model.pkl",
                   explainer_path="saved_model/squadcredit_explainer.pkl"):
    """
    Load the trained model and SHAP explainer from saved files.

    Call this ONCE when your backend starts up.
    Pass the returned objects into score_and_explain() on each request.

    Returns
    -------
    model     : trained LightGBM classifier
    explainer : SHAP TreeExplainer built on the model
    """
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    with open(explainer_path, "rb") as f:
        explainer = pickle.load(f)

    return model, explainer


# ════════════════════════════════════════════════════════════════
# FUNCTION 2 — Feature engineering
# Converts raw Squad transactions into 12 model-ready numbers.
# ════════════════════════════════════════════════════════════════

def extract_features(transactions, association_verified=0,
                     prior_repayment_score=0.0, neighbour_attested=0):
    """
    Convert raw Squad webhook transactions into 12 model features.

    Parameters
    ----------
    transactions          : list of dicts
                            Each dict must have:
                              amount    (float)  — payment amount in Naira
                              sender    (str)    — sender name from Squad webhook
                              timestamp (str)    — ISO format e.g. "2025-01-03T14:22:00"

    association_verified  : int   — 1 if market union verified this trader, else 0
                                    Source: your app's onboarding database
    prior_repayment_score : float — 0.0 if first-time borrower
                                    0.5–1.0 if they repaid cleanly before
                                    Source: your loan history database
    neighbour_attested    : int   — 1 if a fellow stallholder vouched, else 0
                                    Source: your app's attestation database

    Returns
    -------
    dict — 12 features, ready to feed into the model
    """

    df = pd.DataFrame(transactions)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["date"]      = df["timestamp"].dt.date
    df["weekday"]   = df["timestamp"].dt.dayofweek   # 0=Monday 6=Sunday
    df["week"]      = df["timestamp"].dt.isocalendar().week.astype(int)
    df              = df.sort_values("timestamp").reset_index(drop=True)

    # ── Cash Flow ────────────────────────────────────────────────

    # Total money received — higher means more established business
    total_inflow_30d = float(df["amount"].sum())

    # Fraction of days in window that had at least one payment
    # 1.0 = traded every day | 0.1 = barely active
    n_trading_days    = df["date"].nunique()
    total_days        = (df["date"].max() - df["date"].min()).days + 1
    inflow_regularity = n_trading_days / max(total_days, 1)

    # Compare first half vs second half of the window
    # Positive = growing | Negative = shrinking
    mid          = len(df) // 2
    first_half   = df.iloc[:mid]["amount"].sum()
    second_half  = df.iloc[mid:]["amount"].sum()
    inflow_trend = float(np.clip(
        (second_half - first_half) / max(first_half, 1), -1, 1
    ))

    # Average Naira value per individual payment
    avg_payment_size = float(df["amount"].mean())

    # ── Customer ─────────────────────────────────────────────────

    # Count of distinct senders — more = less concentration risk
    unique_customers_30d = int(df["sender"].nunique())

    # Fraction of customers who paid more than once
    # Higher = more loyal, stable customer base
    sender_counts         = df["sender"].value_counts()
    repeat_senders        = int((sender_counts > 1).sum())
    repeat_customer_ratio = repeat_senders / max(len(sender_counts), 1)

    # Week-on-week growth in new customers
    weekly_unique = df.groupby("week")["sender"].nunique()
    if len(weekly_unique) > 1:
        customer_growth_rate = float(np.clip(
            weekly_unique.pct_change().dropna().mean(), 0, 1
        ))
    else:
        customer_growth_rate = 0.0

    # ── Behaviour ────────────────────────────────────────────────

    # How stable are daily inflows?
    # Low variation = consistent trader who keeps a float
    # High variation = spends everything, earns sporadically
    daily_totals = df.groupby("date")["amount"].sum()
    if len(daily_totals) > 1:
        cv = daily_totals.std() / max(daily_totals.mean(), 1)
        savings_retention_rate = float(np.clip(1 - (cv / 3), 0, 1))
    else:
        savings_retention_rate = 0.1

    # Fraction of active trading days that are Mon–Fri
    weekday_trading_ratio = float((df["weekday"] < 5).mean())

    # ── Trust — from database, not transactions ───────────────────

    return {
        "total_inflow_30d":       round(total_inflow_30d,        2),
        "inflow_regularity":      round(inflow_regularity,       4),
        "inflow_trend":           round(inflow_trend,            4),
        "avg_payment_size":       round(avg_payment_size,        2),
        "unique_customers_30d":   unique_customers_30d,
        "repeat_customer_ratio":  round(repeat_customer_ratio,   4),
        "customer_growth_rate":   round(customer_growth_rate,    4),
        "savings_retention_rate": round(savings_retention_rate,  4),
        "weekday_trading_ratio":  round(weekday_trading_ratio,   4),
        "association_verified":   int(association_verified),
        "prior_repayment_score":  round(float(prior_repayment_score), 4),
        "neighbour_attested":     int(neighbour_attested),
    }


# ════════════════════════════════════════════════════════════════
# FUNCTION 3 — Score
# Takes 12 features, returns probability and credit score.
# ════════════════════════════════════════════════════════════════

def get_score(model, features):
    """
    Score a trader using the loaded model.

    Parameters
    ----------
    model    : loaded LightGBM model from load_artifacts()
    features : dict — output of extract_features()

    Returns
    -------
    score       : int   — 0 to 1000
    probability : float — raw model output (0.0 to 1.0)
    tier        : str   — T0 Trial through T6 Anchor
    """
    input_df    = pd.DataFrame([features])[ALL_FEATURES]
    probability = float(model.predict_proba(input_df)[0][1])

    # Convert probability to 0–1000 score with a slight curve
    score = int(np.clip(100 + (probability ** 0.75) * 850, 100, 950))

    if score >= 775:   tier = "T6 Anchor      — up to ₦25M"
    elif score >= 725: tier = "T5 Scale       — up to ₦5M"
    elif score >= 675: tier = "T4 Growth      — up to ₦1.5M"
    elif score >= 625: tier = "T3 Established — up to ₦500K"
    elif score >= 575: tier = "T2 Builder     — up to ₦150K"
    elif score >= 500: tier = "T1 Starter     — up to ₦50K"
    else:              tier = "T0 Trial       — up to ₦15K"

    return score, probability, tier


# ════════════════════════════════════════════════════════════════
# FUNCTION 4 — SHAP Explanation
# Takes 12 features, returns English and Pidgin sentences.
# ════════════════════════════════════════════════════════════════

def explain(explainer, features):
    """
    Run SHAP on the scored features and return human-readable explanations.

    SHAP tells us which features pushed the score up and which pulled it down.
    We translate the top 3 of each into plain sentences.

    Parameters
    ----------
    explainer : loaded SHAP explainer from load_artifacts()
    features  : dict — same output of extract_features() used for scoring

    Returns
    -------
    explanation_en  : list of str — English sentences
    explanation_pid : list of str — Pidgin sentences
    shap_values     : dict — raw SHAP numbers (store these for audit trail)
    """

    input_df    = pd.DataFrame([features])[ALL_FEATURES]
    sv          = explainer.shap_values(input_df)
    trader_shap = (sv[1] if isinstance(sv, list) else sv)[0]
    shap_series = pd.Series(trader_shap, index=ALL_FEATURES)

    top_positive = shap_series[shap_series > 0].sort_values(ascending=False).head(3)
    top_negative = shap_series[shap_series < 0].sort_values(ascending=True).head(3)

    helped = {
        "total_inflow_30d":       ("Your total monthly inflows are strong",        "Your monthly money wey dey enter dey plenty"),
        "inflow_regularity":      ("Your payments come in very consistently",       "Your payments dey come regular regular"),
        "inflow_trend":           ("Your business is growing",                      "Your business dey grow"),
        "avg_payment_size":       ("Your average transaction size is healthy",      "Your average payment dey fine"),
        "unique_customers_30d":   ("You have a diverse customer base",              "You get plenty different customers"),
        "repeat_customer_ratio":  ("Your customers keep coming back to you",        "Your customers dey return to you"),
        "customer_growth_rate":   ("You are gaining new customers consistently",    "New customers dey always come your way"),
        "savings_retention_rate": ("You keep a healthy float in your account",      "You dey save well well"),
        "weekday_trading_ratio":  ("You trade consistently on weekdays",            "You dey trade every market day"),
        "association_verified":   ("Your market association has verified you",      "Your market union don verify you"),
        "prior_repayment_score":  ("You have a strong loan repayment history",      "Your repayment history strong"),
        "neighbour_attested":     ("A fellow trader has vouched for you",            "One trader wey dey near you don vouch for you"),
    }
    hurt = {
        "total_inflow_30d":       ("Your total inflows need to grow more",          "Your monthly money wey dey enter still small"),
        "inflow_regularity":      ("Your payments are coming in irregularly",       "Your payments no dey come steady"),
        "inflow_trend":           ("Your inflows have been declining recently",     "Your money wey dey enter don begin reduce"),
        "avg_payment_size":       ("Your average transaction size is very small",   "Your average payment still too small"),
        "unique_customers_30d":   ("Most payments come from very few people",       "Na only few people dey pay you"),
        "repeat_customer_ratio":  ("You have few returning customers so far",       "Not many customers dey return to you yet"),
        "customer_growth_rate":   ("Your customer base is not growing yet",         "New customers no dey come enough"),
        "savings_retention_rate": ("You spend almost everything you receive",       "You dey spend everything wey enter"),
        "weekday_trading_ratio":  ("Your trading pattern is inconsistent",          "Your trading pattern no steady"),
        "association_verified":   ("You are not yet association-verified",          "Your market union never verify you yet"),
        "prior_repayment_score":  ("No prior repayment history yet",                "You never borrow before so we no get history"),
        "neighbour_attested":     ("No neighbour attestation yet",                  "No trader don vouch for you yet"),
    }

    explanation_en  = []
    explanation_pid = []

    for feat in top_positive.index:
        en, pid = helped.get(feat, (feat, feat))
        explanation_en.append(f"✓  {en}")
        explanation_pid.append(f"✓  {pid}")

    for feat in top_negative.index:
        en, pid = hurt.get(feat, (feat, feat))
        explanation_en.append(f"✗  {en}")
        explanation_pid.append(f"✗  {pid}")

    return explanation_en, explanation_pid, shap_series.round(4).to_dict()


# ════════════════════════════════════════════════════════════════
# MASTER FUNCTION — The only function your backend needs to call
# ════════════════════════════════════════════════════════════════

def score_and_explain(model, explainer, transactions,
                      association_verified=0,
                      prior_repayment_score=0.0,
                      neighbour_attested=0):
    """
    The complete pipeline in one call.

    Call this every time a Squad webhook fires for a trader.

    Parameters
    ----------
    model                 : from load_artifacts()
    explainer             : from load_artifacts()
    transactions          : list of dicts from Squad webhook
                            each dict: {amount, sender, timestamp}
    association_verified  : int   — from your onboarding database
    prior_repayment_score : float — from your loan history database
    neighbour_attested    : int   — from your attestation database

    Returns
    -------
    dict with:
        credit_score     : int   — 0 to 1000
        tier             : str   — e.g. "T2 Builder"
        probability      : float — raw model output
        explanation_en   : list of str — English explanation
        explanation_pid  : list of str — Pidgin explanation
        features         : dict  — the 12 computed features (store for retraining)
        shap_values      : dict  — raw SHAP numbers (store for audit trail)
        scored_at        : str   — ISO timestamp
        model_version    : str   — track which model version was used
    """

    # Step 1: Feature engineering
    features = extract_features(
        transactions,
        association_verified  = association_verified,
        prior_repayment_score = prior_repayment_score,
        neighbour_attested    = neighbour_attested,
    )

    # Step 2: Score
    score, probability, tier = get_score(model, features)

    # Step 3: SHAP explanation
    explanation_en, explanation_pid, shap_vals = explain(explainer, features)

    # Step 4: Return everything
    return {
        "credit_score":    score,
        "tier":            tier,
        "probability":     round(probability, 4),
        "explanation_en":  explanation_en,
        "explanation_pid": explanation_pid,
        "features":        features,
        "shap_values":     shap_vals,
        "scored_at":       pd.Timestamp.now().isoformat(),
        "model_version":   "v1.0-synthetic",
    }