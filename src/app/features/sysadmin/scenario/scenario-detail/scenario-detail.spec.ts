import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioDetail } from './scenario-detail';

describe('ScenarioDetail', () => {
  let component: ScenarioDetail;
  let fixture: ComponentFixture<ScenarioDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
