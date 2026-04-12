import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.html',
  styleUrls: ['./add-post.css']
})
export class AddPost implements OnInit {

  description: string = '';
  markdownPt: string = '';
  markdownEn: string = '';
  activeLang: 'pt' | 'en' = 'pt';
  saved: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  get activeMarkdown(): string {
    return this.activeLang === 'pt' ? this.markdownPt : this.markdownEn;
  }

  set activeMarkdown(value: string) {
    if (this.activeLang === 'pt') {
      this.markdownPt = value;
    } else {
      this.markdownEn = value;
    }
  }

  get wordCount(): number {
    return this.activeMarkdown.trim() ? this.activeMarkdown.trim().split(/\s+/).length : 0;
  }

  get charCount(): number {
    return this.activeMarkdown.length;
  }

  get lineCount(): number {
    return this.activeMarkdown.split('\n').length;
  }

  get renderedMarkdown(): SafeHtml {
    const html = marked.parse(this.activeMarkdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  setLang(lang: 'pt' | 'en'): void {
    this.activeLang = lang;
  }

  onSave(): void {
    console.log({
      description: this.description,
      contentPt: this.markdownPt,
      contentEn: this.markdownEn
    });
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }

  onClear(): void {
    if (this.activeLang === 'pt') {
      this.markdownPt = '';
    } else {
      this.markdownEn = '';
    }
  }
}