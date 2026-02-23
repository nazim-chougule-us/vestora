"""
Vestora Backend — Closet Analytics routes.
Provides aggregated wardrobe insights: wear frequency, cost-per-wear,
color distribution, category breakdown, and AI-generated advice.
"""

from fastapi import APIRouter, Depends
from app.database import wardrobe_items_collection
from app.dependencies import get_current_user
from app.utils.helpers import get_first_ai, get_detected_items
from collections import Counter

router = APIRouter()


@router.get("/overview")
async def analytics_overview(
    current_user: dict = Depends(get_current_user),
):
    """Return aggregated wardrobe analytics."""
    user_id = current_user["_id"]
    col = wardrobe_items_collection()

    cursor = col.find({"user_id": user_id})
    items = await cursor.to_list(length=1000)

    total_items = len(items)
    if total_items == 0:
        return {
            "total_items": 0,
            "total_wears": 0,
            "avg_cost_per_wear": None,
            "wardrobe_value": None,
            "usage_rate": 0,
            "versatility_score": 0,
            "avg_formality": None,
            "most_worn": [],
            "least_worn": [],
            "category_distribution": [],
            "color_distribution": [],
            "season_distribution": [],
            "fabric_distribution": [],
            "occasion_distribution": [],
            "formality_distribution": [],
            "ai_insights": ["Upload wardrobe items to get analytics."],
        }

    # Wear stats
    total_wears = sum(i.get("wear_count", 0) for i in items)
    items_with_price = [i for i in items if i.get("purchase_price")]
    items_with_wears = [i for i in items if i.get("wear_count", 0) > 0 and i.get("purchase_price")]

    avg_cpw = None
    if items_with_wears:
        total_cpw = sum(i["purchase_price"] / i["wear_count"] for i in items_with_wears)
        avg_cpw = round(total_cpw / len(items_with_wears), 2)

    # Most/least worn (top 5 each)
    sorted_by_wear = sorted(items, key=lambda x: x.get("wear_count", 0), reverse=True)
    most_worn = [
        {
            "id": str(i["_id"]),
            "category": get_first_ai(i).get("category", "Unknown"),
            "color": get_first_ai(i).get("primary_color", ""),
            "wear_count": i.get("wear_count", 0),
        }
        for i in sorted_by_wear[:5]
    ]
    least_worn = [
        {
            "id": str(i["_id"]),
            "category": get_first_ai(i).get("category", "Unknown"),
            "color": get_first_ai(i).get("primary_color", ""),
            "wear_count": i.get("wear_count", 0),
        }
        for i in sorted_by_wear[-5:]
    ]

    # Value & usage stats
    wardrobe_value = sum(i.get("purchase_price", 0) or 0 for i in items)
    items_worn = sum(1 for i in items if i.get("wear_count", 0) > 0)
    usage_rate = round(items_worn / total_items * 100) if total_items else 0

    # Distributions
    categories = Counter()
    colors = Counter()
    seasons = Counter()
    fabrics = Counter()
    occasions = Counter()
    formality_scores: list[int] = []

    for item in items:
        for ai in get_detected_items(item):
            if ai.get("category"):
                categories[ai["category"]] += 1
            if ai.get("primary_color"):
                colors[ai["primary_color"]] += 1
            for s in (ai.get("season") or []):
                seasons[s] += 1
            if ai.get("fabric"):
                fabrics[ai["fabric"]] += 1
            for o in (ai.get("occasion") or []):
                occasions[o] += 1
            fs = ai.get("formality_score")
            if fs and isinstance(fs, (int, float)):
                formality_scores.append(int(fs))

    avg_formality = round(sum(formality_scores) / len(formality_scores), 1) if formality_scores else None

    # Formality buckets
    formality_dist: list[dict] = []
    if formality_scores:
        buckets = {"Very Casual (1-3)": 0, "Casual (4-5)": 0, "Smart (6-7)": 0, "Formal (8-10)": 0}
        for fs in formality_scores:
            if fs <= 3:
                buckets["Very Casual (1-3)"] += 1
            elif fs <= 5:
                buckets["Casual (4-5)"] += 1
            elif fs <= 7:
                buckets["Smart (6-7)"] += 1
            else:
                buckets["Formal (8-10)"] += 1
        formality_dist = [{"name": k, "count": v} for k, v in buckets.items() if v > 0]

    # Versatility: how many unique occasions the wardrobe covers
    versatility_score = min(len(occasions), 10)  # cap at 10

    def counter_to_list(c: Counter) -> list[dict]:
        return [{"name": k, "count": v} for k, v in c.most_common(15)]

    # Generate simple AI insights
    ai_insights = []
    if total_items > 0:
        # Color imbalance
        if colors:
            top_color, top_count = colors.most_common(1)[0]
            if top_count > total_items * 0.4:
                ai_insights.append(
                    f"Color imbalance: {round(top_count / total_items * 100)}% of your wardrobe is {top_color}. "
                    f"Consider adding variety with complementary colors."
                )

        # Unused items
        never_worn = sum(1 for i in items if i.get("wear_count", 0) == 0)
        if never_worn > 0:
            pct = round(never_worn / total_items * 100)
            ai_insights.append(
                f"{never_worn} item{'s' if never_worn > 1 else ''} ({pct}%) never worn. "
                f"Consider donating or styling them into new outfits."
            )

        # Category gaps
        has_categories = set(categories.keys())
        essentials = {"T-Shirt", "Pants", "Shoes", "Jacket"}
        missing = essentials - has_categories
        if missing:
            ai_insights.append(
                f"Missing essentials: {', '.join(missing)}. These are wardrobe staples worth adding."
            )

        # Season balance
        if seasons:
            missing_seasons = [s for s in ["Spring", "Summer", "Fall", "Winter"] if seasons.get(s, 0) == 0]
            if missing_seasons:
                ai_insights.append(
                    f"No items for: {', '.join(missing_seasons)}. Consider weather-appropriate additions."
                )

        # Low usage alert
        if usage_rate < 50 and total_items >= 3:
            ai_insights.append(
                f"Only {usage_rate}% of your wardrobe is being worn. Try creating outfits with unused items."
            )

        # Versatility
        if len(occasions) <= 2 and total_items >= 5:
            ai_insights.append(
                "Limited occasion coverage. Your wardrobe mainly suits "
                f"{', '.join(occasions.keys()) or 'casual'} settings. Consider diversifying."
            )

        # Fabric variety
        if fabrics and len(fabrics) == 1:
            ai_insights.append(
                f"All items are {list(fabrics.keys())[0]}. Mixing fabrics adds texture and visual interest."
            )

        # High cost-per-wear items
        if items_with_wears:
            expensive = [i for i in items_with_wears if i["purchase_price"] / i["wear_count"] > 50]
            if expensive:
                ai_insights.append(
                    f"{len(expensive)} item{'s have' if len(expensive) > 1 else ' has'} a cost-per-wear above $50. "
                    "Wear them more to get better value."
                )

        if not ai_insights:
            ai_insights.append("Your wardrobe is well-balanced! Keep experimenting with new styles.")

    return {
        "total_items": total_items,
        "total_wears": total_wears,
        "avg_cost_per_wear": avg_cpw,
        "wardrobe_value": round(wardrobe_value, 2) if wardrobe_value else None,
        "usage_rate": usage_rate,
        "versatility_score": versatility_score,
        "avg_formality": avg_formality,
        "most_worn": most_worn,
        "least_worn": least_worn,
        "category_distribution": counter_to_list(categories),
        "color_distribution": counter_to_list(colors),
        "season_distribution": counter_to_list(seasons),
        "fabric_distribution": counter_to_list(fabrics),
        "occasion_distribution": counter_to_list(occasions),
        "formality_distribution": formality_dist,
        "ai_insights": ai_insights,
    }
