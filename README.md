# Preact MobX
Simple observer decorator for using Preact components with MobX

## Install
```
yarn add preact-mobx
```

## Usage

```tsx
import { h, Component } from 'preact';
import { observable, action, useStrict } from 'mobx';
import { observer } from 'preact-mobx';

useStrict(true);

@observer
class AppComponent extends Component<any, any> {
    @observable
    public name: string;

    @action
    public updateName = (evt: Event) => {
        this.name = (evt.target as HTMLInputElement).value;
    }

    public render() {
        return <div>
            <h1>Hello, {this.name}</h1>
            <input placeholder="Name" value={this.name} onInput={this.updateName} />
        </div>
    }
}
```
