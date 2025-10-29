import { TestBed } from '@angular/core/testing';

import { Beneficiary } from './beneficiary';

describe('Beneficiary', () => {
  let service: Beneficiary;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Beneficiary);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
