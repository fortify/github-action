**`FOD_URL`**    
Required: Fortify on Demand URL, for example https://ams.fortify.com

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`**   
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret)

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`**   
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.

**`EXTRA_FOD_LOGIN_OPTS`**    
Optional: Extra FoD login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli fod session login` documentation]({{var:fcli-doc-base-url}}/manpage/fcli-fod-session-login.html)