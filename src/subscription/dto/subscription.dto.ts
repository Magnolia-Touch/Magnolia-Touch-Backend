import { IsInt, IsString } from 'class-validator';

export class SubscriptionDto {
  @IsString()
  Service_Name: string;

  @IsString()
  Subscription_name: string;

  @IsInt()
  Frequency: number;

  @IsString()
  Price: string;
  
}
