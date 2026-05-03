import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobRecord } from './job-record';

describe('JobRecord', () => {
  let component: JobRecord;
  let fixture: ComponentFixture<JobRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(JobRecord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
