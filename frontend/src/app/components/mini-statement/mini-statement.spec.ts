import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniStatement } from './mini-statement';

describe('MiniStatement', () => {
  let component: MiniStatement;
  let fixture: ComponentFixture<MiniStatement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniStatement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniStatement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
