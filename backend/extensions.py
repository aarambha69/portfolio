from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(
    get_remote_address,
    default_limits=["2000 per day", "500 per hour"],
    storage_uri="memory://",
)
