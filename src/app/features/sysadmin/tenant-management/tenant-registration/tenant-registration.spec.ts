import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantRegistration } from './tenant-registration';

describe('TenantRegistration', () => {
  let component: TenantRegistration;
  let fixture: ComponentFixture<TenantRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
