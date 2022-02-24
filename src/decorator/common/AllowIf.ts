import { ValidationOptions } from '../ValidationOptions';
import { ValidationMetadataArgs } from '../../metadata/ValidationMetadataArgs';
import { ValidationTypes } from '../../validation/ValidationTypes';
import { ValidationMetadata } from '../../metadata/ValidationMetadata';
import { getMetadataStorage } from '../../metadata/MetadataStorage';

/**
 * If object has both allowed and not allowed properties a validation error will be thrown.
 */
export function AllowIf(
  condition: (object: any) => boolean,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string): void {
    const args: ValidationMetadataArgs = {
      type: ValidationTypes.WHITELIST,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [condition],
      validationOptions: validationOptions,
    };
    getMetadataStorage().addValidationMetadata(new ValidationMetadata(args));
  };
}
