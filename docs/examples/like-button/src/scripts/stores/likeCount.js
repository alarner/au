import { Store } from 'au-flux';

const LikeCount = Store.build({
	add_like: {
		run(resolve, reject, action) {
			resolve(this.value() + 1);
		}
	}
});

export default new LikeCount(0);
