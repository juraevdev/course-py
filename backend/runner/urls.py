from django.urls import path

from .views import HealthView, RunCodeView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("run/", RunCodeView.as_view(), name="run-code"),
]
