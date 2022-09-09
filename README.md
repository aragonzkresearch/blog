# AragonZKResearch blog
Aragon ZK Research blog.

## Usage
- Do not commit to `main` branch, always use a branch and do a PR to `main` later on.
- Edit the files from `./blogo-input` directory
- Add a new entry to /blogo-input/blogo.json for each blog post
- Install `blogo` (bin files [can be found here](https://github.com/arnaucube/blogo/blob/master/bin))
- Use `blogo -d` to locally serve the generated blog site
   - This will re-generate the html files each time that a input file is modified, and will serve the html generated site at `http://127.0.0.1:8080`.

Generated files ready to be served are outputed into `docs` directory.

Deployment:
- Just serve the files from `docs` directory in a http server.
