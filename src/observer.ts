import { Component } from 'preact';
import { Reaction } from 'mobx';

function augment(object: object, key: string, func: Function) {
    const origMethod = object[key];
    object[key] = function() {
        (func as any).apply(this, arguments);
        if (origMethod) {
            return (origMethod as any).apply(this, arguments);
        }
    } as any;
}

const mobxReaction = Symbol('mobxReaction');

export function observer(componentClass: typeof Component) {
    augment(componentClass.prototype, 'componentWillMount', function(
        this: Component<any, any>,
    ) {
        const compName =
            (this.constructor as typeof Component).displayName ||
            this.constructor.name;
        this[mobxReaction] = new Reaction(`${compName}.render()`, () =>
            this.forceUpdate(),
        );
    });

    augment(componentClass.prototype, 'componentWillUnmount', function(
        this: Component<any, any>,
    ) {
        this[mobxReaction].dispose();
        this[mobxReaction] = null;
    });

    const origRender = componentClass.prototype.render;
    componentClass.prototype.render = function(this: Component<any, any>): any {
        const args = arguments;

        let renderResult: any;
        this[mobxReaction].track(() => {
            renderResult = origRender.apply(this, args);
        });

        return renderResult;
    };
}
