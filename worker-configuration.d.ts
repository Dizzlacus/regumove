interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

interface ExportedHandler<E = unknown> {
  fetch(request: Request, env: E): Response | Promise<Response>;
}
