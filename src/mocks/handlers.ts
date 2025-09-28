import { http, HttpResponse } from "msw";
import carouselsData from "./dummy.json";

export const handlers = [
  http.get("/api/carousels", () => {
    return HttpResponse.json(carouselsData);
  }),
];
