import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsNumber, IsPositive, IsString, Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GeoType {
  POINT = 'Point'
}

export class GeoPoint {
  @IsEnum(GeoType)
  type!: GeoType;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  coordinates!: Array<number>;

  getLatitude() {
    return this.coordinates[1];
  }

  getLongitude() {
    return this.coordinates[0];
  }
}

export class GenerateItineraryDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GeoPoint)
  startingPoint!: GeoPoint;

  @IsNumber()
  @IsPositive()
  maximumLength!: number;

  @IsNumber()
  @IsPositive()
  numberOfStops!: number;

  @IsArray()
  @IsString({ each: true })
  type!: Array<string>;
}

export class StartingPointDto {
  @IsNumber()
  @IsPositive()
  maximumLength!: number;

  @IsArray()
  @IsString({ each: true })
  type!: Array<string>;
}
