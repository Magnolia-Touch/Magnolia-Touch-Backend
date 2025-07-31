import { IsBoolean, IsString } from 'class-validator';

export class CreateFamilyMemberDto {
  @IsString()
  name: string;
}

export class CreateFamilyDto {
  parents?: CreateFamilyMemberDto[];
  siblings?: CreateFamilyMemberDto[];
  cousins?: CreateFamilyMemberDto[];
  friends?: CreateFamilyMemberDto[];
  spouse?: CreateFamilyMemberDto[];
  nieceAndNephew?: CreateFamilyMemberDto[];
  childrens?: CreateFamilyMemberDto[];
  pets?: CreateFamilyMemberDto[];
  grandchildrens?: CreateFamilyMemberDto[];
  grandparents?: CreateFamilyMemberDto[];
  greatGrandParents?: CreateFamilyMemberDto[];
}
