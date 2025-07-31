import { IsInt, IsString } from 'class-validator';

export class SubscriptionDto {

  @IsString()
  Subscription_name: string;

  @IsString()
  discription: string;

  @IsInt()
  Frequency: number;

  @IsString()
  Price: string;
  
}
