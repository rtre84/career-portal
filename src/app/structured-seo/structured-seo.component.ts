import { Component, Input, HostBinding, OnChanges, Renderer2, Inject } from '@angular/core';
import { JobOrder } from '@bullhorn/bullhorn-types';
import { SettingsService } from '../services/settings/settings.service';
import { SafeHtml, DOCUMENT } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-structured-seo',
  templateUrl: './structured-seo.component.html',
  styleUrls: ['./structured-seo.component.scss'],
})
export class StructuredSeoComponent implements OnChanges {
  @Input() public jobData: JobOrder;
  @HostBinding('innerHTML') public html: SafeHtml;
  constructor(private _renderer2: Renderer2, @Inject(DOCUMENT) private _document: Document, private datePipe: DatePipe) { }

  public ngOnChanges(): void {
    let jsonObject: object = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      'title': this.jobData.title,
      'description': this.jobData.publicDescription,
      'datePosted': this.datePipe.transform(this.jobData.dateLastPublished, 'long'),
      'hiringOrganization': {
        '@type': 'Organization',
        'name': SettingsService.settings.companyName,
        'sameAs': SettingsService.settings.companyUrl,
        'logo': SettingsService.settings.companyLogoPath,
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': this.jobData.address.city,
          'addressRegion': this.jobData.address.state,
          'postalCode': this.jobData.address.zip,
        },
      },
      'baseSalary': {
        '@type': 'MonetaryAmount',
        'value': {
          '@type': 'QuantitativeValue',
          'value': this.jobData.salary,
          'unitText': this.salaryUnit,
        },
      },
    };
    let s: any = this._renderer2.createElement('script');
    s.type = `application/ld+json`;
    s.text = JSON.stringify(jsonObject);
    if(SettingsService.isServer) {
      this._renderer2.appendChild(this._document.body, s);
    }
  }

  get salaryUnit(): string {
    let unit: string; 

    switch (this.jobData.salaryUnit) {
      case 'Per Hour':
        unit = 'HOUR';
        break;
      case 'Per Day':
        unit = 'DAY';
        break;
      default:
        unit = 'YEAR';
        break;
    }

    return unit;
  }

}
