import type { PipeTransform } from '@nestjs/common'
import { BadRequestException } from '@nestjs/common'
import type { AppService } from '@src/services/app.service'
import type { ZodSchema } from 'zod'
import { ZodError } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: ZodSchema,
    private readonly appService: AppService
  ) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value)

      return parsedValue
    } catch (err) {
      if (err instanceof ZodError) {
        const zodErrors = []
        err.issues.forEach((issue) => {
          zodErrors.push(issue.path.join('.'))
          if (this.appService.isDev()) {
            console.log(
              `# ZODERROR Propriedade inválida: ${issue.path.join('.')}`,
              `VALUE: ${value}`,
              `EXPECTED: ${(issue as { expected: string }).expected}`,
              `RECEIVED: ${(issue as { received: string }).received}`
            )
          }
        })

        throw new BadRequestException(
          `Validation failed for: ${zodErrors.join(', ')}`
        )
      }
    }
  }
}
