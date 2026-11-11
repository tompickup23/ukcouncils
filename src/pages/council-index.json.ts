import type { APIRoute } from "astro";
import { councilIndex } from "../lib/council-index";

export const GET: APIRoute = () => new Response(JSON.stringify(councilIndex()), {
  headers: { "Content-Type": "application/json; charset=utf-8" },
});
