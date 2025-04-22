import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'transaction-runner',
    templateUrl: './transaction-runner.component.html',
    styleUrls: ['./transaction-runner.component.css']
})
export class TransactionRunnerComponent implements OnInit {
    transid: String;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit(): void {
    }

    goBack(): void {
        this.location.back();
    }

    runTransaction(): void {
        // console.log('Running transaction ' + this.transid + '...')
        var ca = '';
        this.router.navigate(['/term', this.transid, ca], { skipLocationChange: true });
    }
}