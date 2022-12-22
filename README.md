# AragonZKResearch blog
Aragon ZK Research blog.

## Usage
- Do not commit to `main` branch, always use a branch and do a PR to `main` later on.
- To add a new post (for example called "newpost"):
    - Add the files `newpost.md` and `newpost_thumb.md` to the `./blogo-input/posts` directory
    - Add a new entry to /blogo-input/blogo.json for your blog post
- Install `blogo` (bin files [can be found here](https://github.com/arnaucube/blogo/blob/master/bin))
- Use `blogo -d` to locally serve the generated blog site
   - This will re-generate the html files each time that a input file is modified, and will serve the html generated site at `http://127.0.0.1:8080`.

Generated files ready to be served are output to the `docs` directory.

Deployment:
- Just serve the files from `docs` directory in a http server.
