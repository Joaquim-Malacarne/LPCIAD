import { Component } from '@angular/core';
import { Gallery } from '../gallery/gallery';
import { PostsFeed } from '../posts-feed/posts-feed';

@Component({
  selector: 'app-home',
  imports: [Gallery, PostsFeed],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
