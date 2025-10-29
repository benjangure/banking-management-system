import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryManagement } from './beneficiary-management';

describe('BeneficiaryManagement', () => {
  let component: BeneficiaryManagement;
  let fixture: ComponentFixture<BeneficiaryManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiaryManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiaryManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
