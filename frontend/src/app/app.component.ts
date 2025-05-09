import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CaptionCreatorComponent } from './components/caption-creator/caption-creator.component';
import { WebsocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CaptionCreatorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private websocketService: WebsocketService) {}
}
