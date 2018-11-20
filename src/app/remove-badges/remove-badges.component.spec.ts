import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveBadgesComponent } from './remove-badges.component';

describe('RemoveBadgesComponent', () => {
  let component: RemoveBadgesComponent;
  let fixture: ComponentFixture<RemoveBadgesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveBadgesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
