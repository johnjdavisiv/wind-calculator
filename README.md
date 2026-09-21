# Headwind and tailwind calculator

>By John J. Davis

[See the live app here!](https://apps.runningwritings.com/wind-calculator/)

Front-end UI and back-end calculations for calculating the metabolic effects of headwinds and tailwinds on the metabolic cost of running. 

## Build and deploy

```
npm run build      # stamps this app's own css/js with today's date, then assembles dist/ (exactly the upload set)
```

Deploy = upload the contents of `dist/` to the SiteGround path the build prints. The build fails if a referenced asset is missing, if a page points at a file that is not in `dist/`, or if a `?v=dev` stamp is left. `tools/build-dist.mjs` and `tools/stamp.mjs` are byte-identical across the RW web apps; this app's file list is `rwBuild` in `package.json`.
