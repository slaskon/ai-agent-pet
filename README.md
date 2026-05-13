# AI Agent Pet

This is my personal pet project for using AI agents to generate and assist with code.

The goal is to experiment with intelligent automation, code generation workflows, and agent-driven development tools.

## About

- Personal project by `slaskon`
- Focused on AI agents for code generation
- Intended as an experimental playground for automation, tooling, and agent-based programming

## Status

- Initial repository created and connected to GitHub
- README updated with project purpose
- Changes committed and pushed to the remote repository
- Added a simple solar system webpage schema at `index.html`
- Added Docker support to host the webpage with an Nginx webserver

## Docker

Build the container image:

```bash
docker build -t ai-agent-pet-web .
```

Run the container:

```bash
docker run --rm -p 8080:80 ai-agent-pet-web
```

Then open `http://localhost:8080` to view the solar system webpage.
