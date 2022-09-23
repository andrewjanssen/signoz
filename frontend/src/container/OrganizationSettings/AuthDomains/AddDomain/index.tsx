import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import createDomainApi from 'api/SAML/postDomain';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppState } from 'store/reducers';
import AppReducer from 'types/reducer/app';

import { Container } from '../styles';

function AddDomain(): JSX.Element {
	const { t } = useTranslation(['common', 'organizationsettings']);
	const [isAddDomains, setIsDomain] = useState(false);
	const [form] = useForm<FormProps>();
	const { org } = useSelector<AppState, AppReducer>((state) => state.app);

	const onCreateHandler = async (): Promise<void> => {
		try {
			console.log(form.getFieldValue('domain'), 'asd');
			const response = await createDomainApi({
				name: form.getFieldValue('domain'),
				orgId: (org || [])[0].id,
			});

			if (response.statusCode === 200) {
				notification.success({
					message:
						'Your SAML settings have been saved, please login from incognito window to confirm that it has been set up correctly',
					duration: 15,
				});
				setIsDomain(false);
			} else {
				notification.error({
					message: t('common:something_went_wrong'),
				});
			}
		} catch (error) {
			notification.error({
				message: t('common:something_went_wrong'),
			});
		}
	};

	return (
		<>
			<Container>
				<Typography.Title level={3}>
					{t('authenticated_domains', {
						ns: 'organizationsettings',
					})}
				</Typography.Title>
				<Button
					onClick={(): void => setIsDomain(true)}
					type="primary"
					icon={<PlusOutlined />}
				>
					Add Domains
				</Button>
			</Container>
			<Modal
				centered
				title="Add Domain"
				footer={null}
				visible={isAddDomains}
				destroyOnClose
				onCancel={(): void => setIsDomain(false)}
			>
				<Form form={form} onFinish={onCreateHandler}>
					<Form.Item
						required
						requiredMark
						name={['domain']}
						rules={[
							{
								message: 'Please enter a valid domain',
								required: true,
								type: 'url',
							},
						]}
					>
						<Input placeholder="signoz.io" />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit">
							Add Domain
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}

interface FormProps {
	domain: string;
}

export default AddDomain;
