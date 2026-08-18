from pydantic import BaseModel, ConfigDict


class TicketBase(BaseModel):
    title: str
    description: str
    priority: str = "medium"


class TicketCreate(TicketBase):
    pass


class TicketRead(TicketBase):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)
