import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const successResponseSchema = z.object({
  message: z.string(),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

export class SuccessResponseDto extends createZodDto(successResponseSchema) {}
export class ErrorResponseDto extends createZodDto(errorResponseSchema) {}