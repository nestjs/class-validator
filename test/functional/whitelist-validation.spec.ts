import { Allow, AllowIf, IsDefined, IsOptional, Min } from '../../src/decorator/decorators';
import { Validator } from '../../src/validation/Validator';
import { ValidationTypes } from '../../src';

const validator = new Validator();

describe('whitelist validation', () => {
  it('should strip non whitelisted properties, but leave whitelisted untouched', () => {
    class MyClass {
      @IsDefined()
      title: string;

      @Min(0)
      views: number;
    }

    const model: any = new MyClass();

    model.title = 'hello';
    model.views = 56;
    model.unallowedProperty = 42;
    return validator.validate(model, { whitelist: true }).then(errors => {
      expect(errors.length).toEqual(0);
      expect(model.unallowedProperty).toBeUndefined();
      expect(model.title).toEqual('hello');
      expect(model.views).toEqual(56);
    });
  });

  it('should be able to whitelist with @Allow', () => {
    class MyClass {
      @Allow()
      views: number;
    }

    const model: any = new MyClass();

    model.views = 420;
    model.unallowedProperty = 'non-whitelisted';

    return validator.validate(model, { whitelist: true }).then(errors => {
      expect(errors.length).toEqual(0);
      expect(model.unallowedProperty).toBeUndefined();
      expect(model.views).toEqual(420);
    });
  });

  it("should'n be able to whitelist with @AllowIf when condition return false", () => {
    class MyClass {
      @AllowIf(o => false)
      views: number;
    }

    const model: any = new MyClass();

    model.views = 420;
    model.unallowedProperty = 'non-whitelisted';

    return validator.validate(model, { whitelist: true }).then(errors => {
      expect(errors.length).toEqual(0);
      expect(model.unallowedProperty).toBeUndefined();
      expect(model.views).toBeUndefined();
    });
  });

  it('should be able to whitelist with @AllowIf when condition return true', () => {
    class MyClass {
      @AllowIf(o => true)
      views: number;
    }

    const model: any = new MyClass();

    model.views = 420;
    model.unallowedProperty = 'non-whitelisted';

    return validator.validate(model, { whitelist: true }).then(errors => {
      expect(errors.length).toEqual(0);
      expect(model.unallowedProperty).toBeUndefined();
      expect(model.views).toEqual(420);
    });
  });

  it('should not throw an error when forbidNonWhitelisted flag is set and @AllowIf is true', () => {
    class MyPayload {
      /**
       * Since forbidUnknownValues defaults to true, we must add a property to
       * register the class in the metadata storage. Otherwise the unknown value check
       * would take priority (first check) and exit without running the whitelist logic.
       */
      @IsOptional()
      propertyToRegisterClass: string;

      @AllowIf(o => true)
      conditionalDecorated: string;

      constructor(conditionalDecorated: string) {
        this.conditionalDecorated = conditionalDecorated;
      }
    }

    const instance = new MyPayload('conditional-whitelisted');

    return validator.validate(instance, { whitelist: true, forbidNonWhitelisted: true }).then(errors => {
      expect(errors.length).toEqual(0);
      expect(instance.conditionalDecorated).toEqual('conditional-whitelisted')
    });
  });

  it('should throw an error when forbidNonWhitelisted flag is set and @AllowIf is false', () => {
    class MyPayload {
      /**
       * Since forbidUnknownValues defaults to true, we must add a property to
       * register the class in the metadata storage. Otherwise the unknown value check
       * would take priority (first check) and exit without running the whitelist logic.
       */
      @IsOptional()
      propertyToRegisterClass: string;

      @AllowIf(o => false)
      nonDecorated: string;

      constructor(nonDecorated: string) {
        this.nonDecorated = nonDecorated;
      }
    }

    const instance = new MyPayload('non-whitelisted');

    return validator.validate(instance, { whitelist: true, forbidNonWhitelisted: true }).then(errors => {
      expect(errors.length).toEqual(1);
      expect(errors[0].target).toEqual(instance);
      expect(errors[0].property).toEqual('nonDecorated');
      expect(errors[0].constraints).toHaveProperty(ValidationTypes.WHITELIST);
      expect(() => errors[0].toString()).not.toThrow();
    });
  });

  it('should not throw an error when forbidNonWhitelisted flag is set and @AllowIf is false and property is not set', () => {
    class MyPayload {
      /**
       * Since forbidUnknownValues defaults to true, we must add a property to
       * register the class in the metadata storage. Otherwise the unknown value check
       * would take priority (first check) and exit without running the whitelist logic.
       */
      @IsOptional()
      propertyToRegisterClass: string;

      @AllowIf(o => false)
      conditionalDecorated: string;

    }

    const instance = new MyPayload();

    return validator.validate(instance, { whitelist: true, forbidNonWhitelisted: true }).then(errors => {
      expect(errors.length).toEqual(0);
      expect(instance.conditionalDecorated).toBeUndefined();
    });
  });

  it('should throw an error when forbidNonWhitelisted flag is set', () => {
    class MyPayload {
      /**
       * Since forbidUnknownValues defaults to true, we must add a property to
       * register the class in the metadata storage. Otherwise the unknown value check
       * would take priority (first check) and exit without running the whitelist logic.
       */
      @IsOptional()
      propertyToRegisterClass: string;

      nonDecorated: string;

      constructor(nonDecorated: string) {
        this.nonDecorated = nonDecorated;
      }
    }

    const instance = new MyPayload('non-whitelisted');

    return validator.validate(instance, { whitelist: true, forbidNonWhitelisted: true }).then(errors => {
      expect(errors.length).toEqual(1);
      expect(errors[0].target).toEqual(instance);
      expect(errors[0].property).toEqual('nonDecorated');
      expect(errors[0].constraints).toHaveProperty(ValidationTypes.WHITELIST);
      expect(() => errors[0].toString()).not.toThrow();
    });
  });
});
