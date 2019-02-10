import {Component, EventEmitter, Output} from '@angular/core';
import { SelectMenuItem } from './types/selectMenuItem';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from './services/data.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataService]
})
export class AppComponent {

  @Output() formChanged: EventEmitter<any> = new EventEmitter();

  title = 'custom-select';
  form: FormGroup;
  test: FormGroup;

  undefinedValue: undefined;
  nullValue: undefined;

  options = Array<SelectMenuItem>(
    { value: 1, title: 'Ford' },
    { value: 2, title: 'Kia' },
    { value: 3, title: 'BMW', isDisabled: true }
  );

  brandOptions  = [];
  modelOptions = [];
  yearOptions = [];
  generationOptions = [];

  constructor(fb: FormBuilder, private dataService: DataService) {
    this.form = fb.group({
      fullAutoName: '',
      brand: null,
      model: null,
      year: null,
      generation: null,
    });

    this.test = fb.group( {
      emptyList: null,
      multiSelect: this.options[0],
      undefinedValue: undefined,
      nullValue: null
    });

    this.brandOptions = this.dataService.getBrandOptions();

    this.form.get('fullAutoName').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(val => {
      if (val) {
        const parsed = this.dataService.parseDataFromName(val);
        this.form.patchValue(parsed, {emitEvent: true});
        this.formChanged.emit(this.form.value);
      }
    });
    this.form.get('brand').valueChanges.subscribe(val => {
      if (val) {
        this.modelOptions = this.dataService.getModelOptionsByBrand(val);
        this.formChanged.emit(this.form.value);
      }
    });
    this.form.get('model').valueChanges.subscribe(val => {
      if (val) {
        this.yearOptions = this.dataService.getYearOptionsByModel(val);
        this.formChanged.emit(this.form.value);
      } else {
        this.yearOptions = null;
      }
    });
    this.form.get('year').valueChanges.subscribe(val => {
      if (val) {
        this.generationOptions = this.dataService.getGenerationByYear(val);
        this.formChanged.emit(this.form.value);
      } else {
        this.generationOptions = null;
      }
    });
    this.form.get('generation').valueChanges.subscribe(val => {
      if (val) {
        this.formChanged.emit(this.form.value);
      }
    });

    this.formChanged.subscribe((val) => {
        console.log('Форма изменилась');
        console.log(val);
      }
    )

    this.form.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(val => {
      this.setFullName();
    });
  }

  setFullName() {
    const result = `${this.form.value.brand ? this.form.value.brand.title : ''}${this.form.value.model ? ' ' + this.form.value.model.title : ''}${this.form.value.generation ? ' ' + this.form.value.generation.title : ''}`;
    this.form.patchValue({fullAutoName: result}, {emitEvent: false});
  }
}
