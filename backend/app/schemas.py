from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ---- Auth ----
class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    country: str = "India"
    state: str
    district: str
    village: str
    preferredLanguage: str = "en"
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    village: Optional[str] = None
    token: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserOut


class SendOtpRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    newPassword: str = Field(min_length=6)



# ---- Crop recommendation ----
class CropRecommendRequest(BaseModel):
    soilType: Optional[str] = None
    nitrogen: Optional[float] = 0
    phosphorus: Optional[float] = 0
    potassium: Optional[float] = 0
    temperature: Optional[float] = 25
    humidity: Optional[float] = 60
    rainfall: Optional[float] = 100
    ph: Optional[float] = 6.5
    location: Optional[str] = None


class CropAlternative(BaseModel):
    crop: str
    confidence: float
    yield_: str = Field(alias="yield")

    class Config:
        populate_by_name = True


class NpkPoint(BaseModel):
    name: str
    value: float


class CropRecommendResponse(BaseModel):
    crop: str
    confidence: float
    expectedYield: str
    estimatedProfit: str
    alternatives: List[CropAlternative]
    npkChart: List[NpkPoint]


# ---- Disease detection ----
class DiseaseSuggestion(BaseModel):
    crop: str
    disease: str
    confidence: float


class DiseaseResult(BaseModel):
    disease: str
    confidence: float
    severity: str
    crop: str
    treatment: List[str]
    prevention: List[str]
    symptoms: Optional[str] = None
    suggestions: List[DiseaseSuggestion] = []
    model_used: Optional[str] = None
    crop_confidence: Optional[float] = None



# ---- Weather ----
class CurrentWeather(BaseModel):
    location: str
    tempC: float
    condition: str
    humidity: float
    windKph: float
    rainChance: float


class HourlyPoint(BaseModel):
    hour: str
    tempC: float
    rain: float


class DailyPoint(BaseModel):
    day: str
    high: float
    low: float
    rain: float
    humidity: float


class WeatherAlert(BaseModel):
    id: int
    title: str
    level: str


class RainAlertRequest(BaseModel):
    recipient_email: Optional[EmailStr] = None
    recipient_phone: Optional[str] = None
    location: str = "Warangal"
    rain_probability: float = 80.0
    message_custom: Optional[str] = None


class RainAlertResponse(BaseModel):
    status: str
    email_sent: bool
    sms_sent: bool
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    message: str


class IrrigationPredictRequest(BaseModel):
    crop: str = "Cotton"
    growth_stage: str = "Flowering Stage"
    soil_type: str = "Black Cotton Soil"
    avg_temp_c: Optional[float] = 28.0
    rain_probability_pct: Optional[float] = 30.0
    humidity_pct: Optional[float] = 60.0


class IrrigationPredictResponse(BaseModel):
    water_requirement_mm: float
    irrigation_interval_days: float
    crop: str
    growth_stage: str
    soil_type: str
    advice: str




# ---- Market ----
class MarketPriceOut(BaseModel):
    crop: str
    price: float
    unit: str
    trend: str
    change: float


class NearbyMarketOut(BaseModel):
    name: str
    distanceKm: float


class TrendPoint(BaseModel):
    month: str
    price: float


# ---- Schemes ----
class SchemeOut(BaseModel):
    id: int
    name: str
    category: str
    eligibility: str
    documents: str
    description: str

    class Config:
        from_attributes = True


# ---- Reports ----
class ReportOut(BaseModel):
    id: int
    title: str
    date: str


class GenerateReportRequest(BaseModel):
    type: str = "Farm Summary"


# ---- News ----
class NewsItem(BaseModel):
    title: str
    link: str
    source: str
    published: Optional[str] = None
    summary: Optional[str] = None
