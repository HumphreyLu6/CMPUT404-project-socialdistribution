from rest_framework import routers
from django.urls import path, include
from .views import NodeViewSet

router = routers.DefaultRouter()

router.register("",NodeViewSet,basename="node")

urlpatterns = [
    path("",include(router.urls))
]
