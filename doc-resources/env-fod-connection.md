**`FOD_URL`** - REQUIRED   
Fortify on Demand URL, for example https://ams.fortify.com. Note: Using GitHub Secrets to define this URL may cause links back to FoD to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables)  instead of GitHub Secrets. 

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`** - REQUIRED*    
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret).

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`** - REQUIRED*    
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.
