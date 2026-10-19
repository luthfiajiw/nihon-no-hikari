import { Select as SelectPrimitive } from 'bits-ui';
import Content from './select-content.svelte';
import Item from './select-item.svelte';
import ScrollDownButton from './select-scroll-down-button.svelte';
import ScrollUpButton from './select-scroll-up-button.svelte';
import Trigger from './select-trigger.svelte';
import Value from './select-value.svelte';

const Root = SelectPrimitive.Root;

export {
	Root,
	Content,
	Item,
	ScrollDownButton,
	ScrollUpButton,
	Trigger,
	Value,
	Root as Select,
	Content as SelectContent,
	Item as SelectItem,
	ScrollDownButton as SelectScrollDownButton,
	ScrollUpButton as SelectScrollUpButton,
	Trigger as SelectTrigger,
	Value as SelectValue
};
