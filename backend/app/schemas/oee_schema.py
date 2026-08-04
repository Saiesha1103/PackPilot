from pydantic import BaseModel, Field, model_validator


class OEEInput(BaseModel):
    planned_production_time: float = Field(gt=0)
    run_time: float = Field(ge=0)
    ideal_cycle_time: float = Field(gt=0)
    total_units: int = Field(gt=0)
    good_units: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_oee_inputs(self):
        if self.run_time > self.planned_production_time:
            raise ValueError(
                "Run time cannot exceed planned production time"
            )

        if self.good_units > self.total_units:
            raise ValueError(
                "Good units cannot exceed total units"
            )

        return self


class OEEResponse(BaseModel):
    availability: float
    performance: float
    quality: float
    oee: float