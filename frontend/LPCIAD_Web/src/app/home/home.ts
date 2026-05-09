import { Component } from '@angular/core';
import { Gallery } from '../gallery/gallery';
import { PostList } from '../post-list/post-list';

@Component({
  selector: 'app-home',
  imports: [Gallery, PostList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}