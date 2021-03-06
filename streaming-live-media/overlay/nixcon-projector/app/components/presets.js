import React, {Component} from "react";
import PropTypes from "prop-types";
import findIndex from "lodash/findIndex";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";

const saved_configs = [
	"talk",
	"name",
	"alias",
	"avatar"
];

const normalize = (v, {with_gfx = false}) => {
	const configs = [].concat(saved_configs);
	if (with_gfx) {
		configs.push("gfx");
	}

	return pickBy(
		pick(v, configs),
		(v) => !isEmpty(v)
	);
};

class Presets extends Component {
	constructor() {
		super();
	}
	get current() {
		const {preset: {configs}} = this.context;
		const {config} = this.props;

		return findIndex(configs, (el) => {
			const with_gfx = !isEmpty(el["gfx"]);

			return isEqual(normalize(el, {with_gfx}), normalize(config, {with_gfx}))
		});
	}
	handleChange(e) {
		const value = parseInt(e.target.value);
		const {preset: {configs}} = this.context;

		const config = configs[value];

		this.props.onChange(config);
	}
	handleRemove() {
		if (this.current === -1) {
			return;
		}
		const {preset: {configs, save}} = this.context;

		const data = [].concat(
			configs.slice(0, this.current),
			configs.slice(this.current+1),
		);

		save(data);
	}
	handleAdd() {
		const {config} = this.props;

		const {preset: {configs, save}} = this.context;

		save([].concat(configs, [config]));
	}
	handleMove(direction) {
		if (this.current === -1) {
			return;
		}
		const {preset: {configs, save}} = this.context;

		if (direction === -1 && this.current === 0) {
			return;
		}
		if (direction === 1 && this.current === configs.length) {
			return;
		}

		// Whew, this is a weird thing, but this basically inserts at the
		// expected location depending on the direction.
		const data = [].concat(
			configs.slice(0, Math.max(this.current-1, 0)),
			direction === -1 ? [configs[this.current]] : [],
			configs.slice(Math.max(this.current-1, 0), this.current),

			configs.slice(this.current+1, this.current+2),
			direction === 1 ? [configs[this.current]] : [],
			configs.slice(this.current+2),
		);

		save(data);
	}
	render() {
		const {preset} = this.context;
		const {current} = this;

		return (
			<div className="presets">
				<h3>Presets</h3>
				<select size="9" onChange={(e) => this.handleChange(e)} value={current.toString()}>
					<option disabled="disabled" value="-1">Choose a preset to change the configuration...</option>
					{preset.configs.map((config, i) => {
						const {name, talk = "[no talk]"} = config;
						const id = config["_id"] || `${name} / ${talk}`;

						return (
							<option value={i} key={i}>{id}</option>
						);
					})}
				</select>
				<div>
					<button onClick={() => this.handleAdd()}>➕Add preset</button>
					<button onClick={() => this.handleRemove()}>➖Remove preset</button>
					<button onClick={() => this.handleMove(-1)}>{" "}↑{" "}</button>
					<button onClick={() => this.handleMove( 1)}>{" "}↓{" "}</button>
				</div>
			</div>
		);
	}
}

Presets.contextTypes = {
	preset: PropTypes.object,
}


export default Presets;
