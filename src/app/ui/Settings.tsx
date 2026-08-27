import { ArrowsRotateLeft, Moon, Sun } from "@gravity-ui/icons";
import { Settings as GravitySettings } from "@gravity-ui/navigation";
import { Icon, SegmentedRadioGroup } from "@gravity-ui/uikit";
import { useLocalStorage } from "@reactuses/core";

import { useMobile } from "@/shared/hooks";

export const Settings = () => {
	const [theme, setTheme] = useLocalStorage("theme", "system");
	const isMobile = useMobile();

	return (
		<GravitySettings filterPlaceholder="Поиск" title="Настройки" view={isMobile ? "mobile" : "normal"}>
			<GravitySettings.Page title="Внешний вид">
				<GravitySettings.Section title="Интерфейс">
					<GravitySettings.Item title="Тема интерфейса">
						<SegmentedRadioGroup onUpdate={setTheme} size="l" value={theme ?? "system"}>
							<SegmentedRadioGroup.Option value="system">
								<Icon data={ArrowsRotateLeft} />
							</SegmentedRadioGroup.Option>
							<SegmentedRadioGroup.Option value="light">
								<Icon data={Sun} />
							</SegmentedRadioGroup.Option>
							<SegmentedRadioGroup.Option value="dark">
								<Icon data={Moon} />
							</SegmentedRadioGroup.Option>
						</SegmentedRadioGroup>
					</GravitySettings.Item>
				</GravitySettings.Section>
			</GravitySettings.Page>
		</GravitySettings>
	);
};
