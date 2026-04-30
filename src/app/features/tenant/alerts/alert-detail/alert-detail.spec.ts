import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetail } from './alert-detail';

describe('AlertDetail', () => {
  let component: AlertDetail;
  let fixture: ComponentFixture<AlertDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
