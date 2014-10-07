<?
$aOperations = explode(';',$aRow['session']);
print '<tr><td rowspan="'.count($aOperations).'"><b><a href="' . ADMIN_FILE . '?action=logs&amp;do=chests&amp;user=' . $aRow['user'] . '&amp;server=' . $aSrv['id'].'">'.$aRow['username'].'</a></b><br />';
if($aRow['chest_owner'] == -1)
	print '---';
else
	print $aRow['ownername'];
print '</td>';
$bFirst = true;
foreach($aOperations as $sOperation) {
	if(!$bFirst)
		print '<tr>';
	print '<td>';
	$i = 1;
	$sOp = substr($sOperation, 0, 1);
	if($sOp == '-') {
		$sOp = substr($sOperation, 0, 2);
		$i = 2;
	}
	if($sOp == '<') {
		$sOp2 = substr($sOperation, 0, 2);
		if($sOp2 == '<-') {
			$sOp = $sOp2;
			$i = 2;
		}
	}
	if($sOp == 'C' || $sOp == 'I') {
		$sOp = substr($sOperation, 0, 2);
		$i = 2;
	}
	$aItemOp = explode(',', substr($sOperation, $i));
	$aItem = $aItems[$aItemOp[0]][$aItemOp[2]];
	if(!$aItem) {
		$rRes2 = mysql_query("SELECT * FROM `mainserver`.`items` WHERE `id` = ".$aItemOp[0]." AND `data` = ".$aItemOp[2],MINECRAFT_DB);
		$aRow1 = mysql_fetch_assoc($rRes2);
		if($aRow1) {
			$aItem = $aRow1;
		} else {
			$rRes2 = mysql_query("SELECT * FROM `mainserver`.`items` WHERE `id` = ".$aItemOp[0]." AND `data` = 0",MINECRAFT_DB);
			$aRow1 = mysql_fetch_assoc($rRes2);
			if($aRow1) {
				$aItem = $aRow1;
			} else {
				$aItem['image'] = '';
				$aItem['name'] = '';
				$aItem['id'] = $aItemOp[0];
				$aItem['data'] = $aItemOp[2];
			}
		}
		$aItems[$aItemOp[0]][$aItemOp[2]] = $aItem;
	}
	if(!empty($aItem['image']))
		print '<img src="/img/items/'.$aItem['image'].'" title="'.$aItem['name'].'" width="32px" height="32px" align="left" style="margin-right: 5px;" />';
	print '<b>';
	$name = null;
	$prefix = null;
	$suffix = null;
	$title = null;
	if(count($aItemOp) > 3) {
		$json = json_decode($aItemOp[3], true);
		if($json) {
			$prefix = $json['NamePrefix'];
			if(is_array($prefix))
				$prefix = $prefix[0];
			$name = $json['Name'];
			if(is_array($name))
				$name = $name[0];
			$suffix = $json['NameSuffix'];
			if(is_array($suffix))
				$suffix = $suffix[0];
			$title = $json['title'];
			if(is_array($title))
				$title = $title[0];
		}
	}
	if($prefix)
		print $prefix . ' ';
	if($name)
		print $name;
	else
		print $aItem['name'];
	if($suffix)
		print ' ' . $suffix;
	if($name)
		print ' (' . $aItem['name'] .')';
	print ' ('.$aItem['id'].','.$aItemOp[2].')</b>';
	if($title)
		print ' <i>' . $title . '</i>';
	print '<br />';
	if($sOp == 'X')
		print 'выброшен';
	elseif($sOp == '<-')
		print 'взят из сундука';
	elseif($sOp == '->')
		print 'положен в сундук';
	elseif($sOp == '<')
		print 'взят из инвентаря';
	elseif($sOp == '>')
		print 'положен в инвентарь';
	elseif($sOp == 'CI')
		print 'из сундука в инвентарь';
	elseif($sOp == 'IC')
		print 'из инвентаря в сундук';
	elseif($sOp == 'IX')
		print 'выброшен из инвентаря';
	elseif($sOpe == 'CX')
		print 'выброшен из сундука';
	print ' <b>'.$aItemOp[1].'</b>';
	print '</td>';
	if($bFirst) {
		print '<td rowspan="'.count($aOperations).'">'.$aRow['time'].'</td>';
		print '<td rowspan="'.count($aOperations).'">'.$aRow['x'].' ' . $aRow['y'] . ' ' . $aRow['z'] . '</td>';
	}
	$bFirst = false;
	print '</tr>';
}
