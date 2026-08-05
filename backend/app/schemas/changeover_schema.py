from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class ChangeoverCreate(BaseModel):
    machine_id: int
    from_product: str = Field(min_length=1)
    to_product: str = Field(min_length=1)


    @model_validator(mode="after")
    def validate_products(self):
        if self.from_product == self.to_product:
            raise ValueError(
                "From product and To product cannot be the same"
            )

        return self


class ChangeoverClose(BaseModel):
    end_time: datetime | None = None


class ChangeoverResponse(BaseModel):
    id: int
    machine_id: int
    from_product: str
    to_product: str
    start_time: datetime
    end_time: datetime | None
    duration_minutes: int | None

    model_config = {
        "from_attributes": True
    }


class ChangeoverAnalyticsResponse(BaseModel):
    total_changeovers: int
    average_duration_minutes: float
    total_changeover_minutes: int