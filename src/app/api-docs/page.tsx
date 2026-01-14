import { swaggerSpec } from "@/app/lib/swagger";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return <SwaggerUI spec={swaggerSpec} />;
}