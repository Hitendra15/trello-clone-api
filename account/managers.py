from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Defines how the User(or the model to which attached)
    will create users and superusers.
    """
    def create_user(
        self,
        first_name,
        last_name,
        email, 
        password,
        password2=None
        ):
        """
        Create and save a user with the given email, password.
        """
        if not email:
            raise ValueError(_("The Email must be set"))
        email = self.normalize_email(email) # lowercase the domain
        user = self.model(
            first_name=first_name,
            last_name=last_name,
            email=email
        )
        user.set_password(password) # hash raw password and set
        user.save()
        return user
    
    def create_superuser(
        self,
        first_name,
        last_name,
        email, 
        password
        ):
        """
        Create and save a superuser with the given email, 
        password. Extra fields are added
        to indicate that the user is staff, active, and indeed
        a superuser.
        """
        user = self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user