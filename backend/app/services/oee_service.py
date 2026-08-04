def calculate_oee(data):
    availability = (
        data.run_time /
        data.planned_production_time
    )

    performance = (
        data.ideal_cycle_time *
        data.total_units
    ) / data.run_time if data.run_time > 0 else 0

    quality = (
        data.good_units /
        data.total_units
    )

    oee = (
        availability *
        performance *
        quality
    )

    return {
        "availability": round(availability * 100, 2),
        "performance": round(performance * 100, 2),
        "quality": round(quality * 100, 2),
        "oee": round(oee * 100, 2),
    }